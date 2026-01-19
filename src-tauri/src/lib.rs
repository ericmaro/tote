// Tote - Link Collection App
// Tauri backend commands

use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct LinkMetadata {
    pub title: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheResult {
    pub title: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub image: Option<String>,
    pub content_path: String,
    pub icon_path: Option<String>,
    pub image_path: Option<String>,
}

#[tauri::command]
async fn fetch_link_metadata(url: String) -> Result<LinkMetadata, String> {
    // Fetch the HTML with a User-Agent
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch URL: {}", e))?;

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let (title, description, icon, image) = parse_metadata(&html, &url);

    Ok(LinkMetadata {
        title,
        description,
        icon,
        image,
    })
}

fn parse_metadata(
    html: &str,
    url: &str,
) -> (String, Option<String>, Option<String>, Option<String>) {
    let document = Html::parse_document(html);
    let base_url = url::Url::parse(url).ok();

    let resolve_url = |href: &str| -> Option<String> {
        if href.starts_with("http") {
            Some(href.to_string())
        } else if let Some(base) = &base_url {
            base.join(href).ok().map(|u| u.to_string())
        } else {
            None
        }
    };

    let title = get_meta_content(&document, "og:title")
        .or_else(|| get_meta_content(&document, "twitter:title"))
        .or_else(|| {
            let selector = Selector::parse("title").ok()?;
            document
                .select(&selector)
                .next()?
                .text()
                .collect::<String>()
                .into()
        })
        .unwrap_or_else(|| {
            base_url
                .as_ref()
                .map(|u| u.host_str().unwrap_or("Unknown").to_string())
                .unwrap_or_else(|| "Unknown".to_string())
        });

    let description = get_meta_content(&document, "og:description")
        .or_else(|| get_meta_content(&document, "twitter:description"))
        .or_else(|| get_meta_name_content(&document, "description"));

    let icon = get_link_href(&document, "apple-touch-icon")
        .or_else(|| get_link_href(&document, "icon"))
        .or_else(|| get_link_href(&document, "shortcut icon"))
        .and_then(|href| resolve_url(&href))
        .or_else(|| {
            base_url.as_ref().map(|u| {
                format!(
                    "{}://{}/favicon.ico",
                    u.scheme(),
                    u.host_str().unwrap_or("")
                )
            })
        });

    let image = get_meta_content(&document, "og:image")
        .or_else(|| get_meta_content(&document, "twitter:image"))
        .and_then(|src| resolve_url(&src));

    (
        title.trim().to_string(),
        description.map(|s| s.trim().to_string()),
        icon,
        image,
    )
}

#[tauri::command]
async fn cache_link(app: tauri::AppHandle, id: String, url: String) -> Result<CacheResult, String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?;

    let link_dir = cache_dir.join("links").join(&id);
    fs::create_dir_all(&link_dir).map_err(|e| format!("Failed to create link dir: {}", e))?;

    // 1. Fetch and save HTML with User-Agent
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch URL: {}", e))?;

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let content_path = link_dir.join("content.html");
    fs::write(&content_path, &html).map_err(|e| format!("Failed to save HTML: {}", e))?;

    let (title, description, icon_url, image_url) = parse_metadata(&html, &url);

    // 2. Download and save icon
    let mut icon_local_path = None;
    if let Some(ref u) = icon_url {
        if let Ok(response) = client.get(u).send().await {
            if let Ok(bytes) = response.bytes().await {
                // Determine extension
                let ext = u
                    .split('.')
                    .last()
                    .unwrap_or("png")
                    .split('?')
                    .next()
                    .unwrap_or("png");
                let path = link_dir.join(format!("icon.{}", ext));
                if fs::write(&path, &bytes).is_ok() {
                    icon_local_path = Some(path.to_string_lossy().to_string());
                }
            }
        }
    }

    // 3. Download and save image
    let mut image_local_path = None;
    if let Some(ref u) = image_url {
        if let Ok(response) = client.get(u).send().await {
            if let Ok(bytes) = response.bytes().await {
                let ext = u
                    .split('.')
                    .last()
                    .unwrap_or("jpg")
                    .split('?')
                    .next()
                    .unwrap_or("jpg");
                let path = link_dir.join(format!("image.{}", ext));
                if fs::write(&path, &bytes).is_ok() {
                    image_local_path = Some(path.to_string_lossy().to_string());
                }
            }
        }
    }

    Ok(CacheResult {
        title,
        description,
        icon: icon_url,
        image: image_url,
        content_path: content_path.to_string_lossy().to_string(),
        icon_path: icon_local_path,
        image_path: image_local_path,
    })
}

#[tauri::command]
async fn remove_cached_link(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?;

    let link_dir = cache_dir.join("links").join(&id);
    if link_dir.exists() {
        fs::remove_dir_all(link_dir).map_err(|e| format!("Failed to remove link dir: {}", e))?;
    }

    Ok(())
}

fn get_meta_content(document: &Html, property: &str) -> Option<String> {
    let selector = Selector::parse(&format!("meta[property=\"{}\"]", property)).ok()?;
    document
        .select(&selector)
        .next()?
        .value()
        .attr("content")
        .map(|s| s.to_string())
}

fn get_meta_name_content(document: &Html, name: &str) -> Option<String> {
    let selector = Selector::parse(&format!("meta[name=\"{}\"]", name)).ok()?;
    document
        .select(&selector)
        .next()?
        .value()
        .attr("content")
        .map(|s| s.to_string())
}

fn get_link_href(document: &Html, rel: &str) -> Option<String> {
    let selector = Selector::parse(&format!("link[rel=\"{}\"]", rel)).ok()?;
    document
        .select(&selector)
        .next()?
        .value()
        .attr("href")
        .map(|s| s.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            fetch_link_metadata,
            cache_link,
            remove_cached_link
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
