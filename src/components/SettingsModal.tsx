import React from 'react';
import { X } from 'lucide-react';
import { ProviderConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProviderConfig;
  onSave: (config: ProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [localConfig, setLocalConfig] = React.useState<ProviderConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inference Engine & Settings</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>AI Inference Engine</label>
            <select
              className="form-select"
              value={localConfig.provider}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  provider: e.target.value as ProviderConfig['provider']
                }))
              }
            >
              <option value="local-engine">Built-in High-Fidelity Heuristic Engine (Offline & Fast)</option>
              <option value="gemini">Google Gemini (Gemini 1.5 Pro / Flash)</option>
              <option value="openai">OpenAI (GPT-4o / o1)</option>
              <option value="anthropic">Anthropic Claude (3.5 Sonnet)</option>
              <option value="ollama">Local Ollama Endpoint</option>
            </select>
          </div>

          {localConfig.provider !== 'local-engine' && (
            <div className="form-group">
              <label>API Key or Auth Token</label>
              <input
                type="password"
                className="form-input"
                placeholder={localConfig.provider === 'ollama' ? 'Optional for local Ollama' : 'sk-...'}
                value={localConfig.apiKey || ''}
                onChange={(e) =>
                  setLocalConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                }
              />
            </div>
          )}

          {localConfig.provider === 'ollama' && (
            <div className="form-group">
              <label>Ollama Base URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="http://localhost:11434"
                value={localConfig.baseUrl || 'http://localhost:11434'}
                onChange={(e) =>
                  setLocalConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>Model Identifier</label>
            <input
              type="text"
              className="form-input"
              placeholder={
                localConfig.provider === 'gemini'
                  ? 'gemini-1.5-pro'
                  : localConfig.provider === 'openai'
                  ? 'gpt-4o'
                  : localConfig.provider === 'ollama'
                  ? 'llama3.1:8b'
                  : 'builtin-ast-engine'
              }
              value={localConfig.model || ''}
              onChange={(e) =>
                setLocalConfig((prev) => ({ ...prev, model: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>Sampling Temperature: {localConfig.temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
              value={localConfig.temperature}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  temperature: parseFloat(e.target.value)
                }))
              }
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn-action btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-action btn-primary">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
