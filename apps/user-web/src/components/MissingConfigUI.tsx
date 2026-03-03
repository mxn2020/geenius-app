import React from "react"
import "./MissingConfigUI.css"

interface MissingConfigUIProps {
    configs: {
        key: string
        description: string
        isMissing: boolean
    }[]
}

export const MissingConfigUI: React.FC<MissingConfigUIProps> = ({ configs }) => {
    return (
        <div className="missing-config-container">
            <div className="missing-config-card">
                <div className="missing-config-header">
                    <div className="warning-icon">⚠️</div>
                    <h1>Setup Required</h1>
                    <p>Please configure the following environment variables to run Geenius.</p>
                </div>

                <div className="missing-config-list">
                    {configs.map((config) => (
                        <div
                            key={config.key}
                            className={`config-item ${config.isMissing ? "missing" : "present"}`}
                        >
                            <div className="config-status-icon">{config.isMissing ? "❌" : "✅"}</div>
                            <div className="config-details">
                                <code className="config-key">{config.key}</code>
                                <span className="config-desc">{config.description}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="missing-config-footer">
                    <p>
                        Create a <code>.env.local</code> file in this app's root directory and restart the
                        development server.
                    </p>
                </div>
            </div>
        </div>
    )
}
