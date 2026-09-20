'use client';

import React, { useState } from 'react';
import { Server, Key, Terminal, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  );
  const [streamerUrl, setStreamerUrl] = useState(
    process.env.NEXT_PUBLIC_STREAMER_URL || 'ws://localhost:8001/ws'
  );
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header Bar */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Settings & Environment
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure API endpoints, WebSocket log streamers, and system integration settings
        </p>
      </div>

      {savedToast && (
        <div className="p-3 rounded-md bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={14} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Backend Endpoints */}
        <Card className="p-5 bg-[#161B22] border-[#30363D] space-y-4">
          <div className="flex items-center gap-2 text-[#F0F6FC] font-semibold text-sm">
            <Server size={16} className="text-[#58A6FF]" />
            <span>Backend Service Connections</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8B949E]">
                Nimbus API Endpoint
              </label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="font-mono text-xs bg-[#0D1117] border-[#30363D] text-[#F0F6FC]"
              />
              <p className="text-[11px] text-[#8B949E]">
                Default: http://localhost:8000/api
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8B949E]">
                WebSocket Log Streamer Endpoint
              </label>
              <Input
                value={streamerUrl}
                onChange={(e) => setStreamerUrl(e.target.value)}
                className="font-mono text-xs bg-[#0D1117] border-[#30363D] text-[#F0F6FC]"
              />
              <p className="text-[11px] text-[#8B949E]">
                Default: ws://localhost:8001/ws
              </p>
            </div>
          </div>
        </Card>

        {/* GitHub Webhook Info */}
        <Card className="p-5 bg-[#161B22] border-[#30363D] space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Key size={16} className="text-amber-400" />
            <span>GitHub Webhook & App Integration</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure your GitHub repository webhook payload URL to receive automated push events:
          </p>

          <div className="p-2.5 rounded-md bg-[#04070D] border border-border/60 font-mono text-xs text-foreground flex items-center justify-between">
            <span>http://localhost:8000/webhooks/github</span>
            <span className="text-[10px] text-muted-foreground">POST</span>
          </div>

          <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
            <p>• Content type: <code className="text-foreground">application/json</code></p>
            <p>• Secret: Match your configured <code className="text-foreground">GITHUB_WEBHOOK_SECRET</code></p>
            <p>• Events: Just the <code className="text-foreground">push</code> event</p>
          </div>
        </Card>

        {/* Action button */}
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Check size={13} />
            <span>Save settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
