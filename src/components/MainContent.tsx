/**
 * TOTE - Main Content Component
 * Central content area with topbar
 */

import { GitBranchIcon, SparklesIcon, TerminalIcon, HomeIcon, CodeIcon } from "./Icons";

export function MainContent() {
    return (
        <main className="main">
            {/* Top Bar */}
            <header className="main-topbar">
                <div className="main-topbar-left">
                    <div className="workspace-title-line">
                        <span className="workspace-title-text">my-project</span>
                        <span className="workspace-separator">/</span>
                        <span className="workspace-branch">
                            <GitBranchIcon size={12} /> main
                        </span>
                    </div>
                </div>
                <div className="main-topbar-right">
                    <button className="action-button">
                        <TerminalIcon size={14} />
                        Terminal
                    </button>
                    <button className="action-button">
                        <SparklesIcon size={14} />
                        New Agent
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Home Dashboard */}
                <div className="home-grid">
                    <div className="home-card">
                        <div className="home-card-header">
                            <div className="home-card-icon">
                                <SparklesIcon size={20} />
                            </div>
                            <span className="home-card-title">Start a new conversation</span>
                        </div>
                        <p className="home-card-description">
                            Launch a new AI agent to help with coding, debugging, or exploring your codebase.
                        </p>
                    </div>

                    <div className="home-card">
                        <div className="home-card-header">
                            <div className="home-card-icon">
                                <TerminalIcon size={20} />
                            </div>
                            <span className="home-card-title">Open Terminal</span>
                        </div>
                        <p className="home-card-description">
                            Access the integrated terminal for running commands and scripts.
                        </p>
                    </div>

                    <div className="home-card">
                        <div className="home-card-header">
                            <div className="home-card-icon">
                                <GitBranchIcon size={20} />
                            </div>
                            <span className="home-card-title">Git Status</span>
                        </div>
                        <p className="home-card-description">
                            View changes, commits, and manage branches in your repository.
                        </p>
                    </div>

                    <div className="home-card">
                        <div className="home-card-header">
                            <div className="home-card-icon">
                                <CodeIcon size={20} />
                            </div>
                            <span className="home-card-title">Review Code</span>
                        </div>
                        <p className="home-card-description">
                            Get AI-powered code reviews for your uncommitted changes or branches.
                        </p>
                    </div>

                    <div className="home-card">
                        <div className="home-card-header">
                            <div className="home-card-icon">
                                <HomeIcon size={20} />
                            </div>
                            <span className="home-card-title">Recent Activity</span>
                        </div>
                        <p className="home-card-description">
                            View your recent agent conversations and quickly resume where you left off.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
