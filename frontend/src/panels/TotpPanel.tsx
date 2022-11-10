import { useState } from "react";
import { Surface, Stack, Button, Input } from "../components";
import QRCode from "react-qr-code";

interface Props {
    enabled: boolean;
}

interface TotpSetupData {
    url: string;
    codes: string;
}

function TotpPanel({ enabled }: Props) {
    const [setupCode, setSetupCode] = useState<string>();
    const [setupData, setSetupData] = useState<TotpSetupData>();
    const [backupCodes, setBackupCodes] = useState<string>();
    const [error, setError] = useState<string>();

    function setupTotp() {
        fetch("/api/totp/setup")
            .then((res) => res.json())
            .then((data) => {
                setError(undefined);
                setSetupData(data);
            });
    }

    function enableTotp(code: string | undefined) {
        if(!code) return setError("No code");
        fetch("/api/totp/enable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return setError(data.message);
                if(setupData) setBackupCodes(setupData.codes);
                setSetupData(undefined);
            });
    }

    function disableTotp() {
        fetch("/api/totp/disable", { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                window.open("/", "_self");
            });
    }

    if(setupData) {
        return (
            <Surface>
                <h1>Setup Two Factor</h1>
                <p>
                    To setup two factor authentication, use the google authenticator
                    app and scan the QR code.
                </p>
                <QRCode value={setupData.url} />
                <p style={{ color: "red" }}>{error}</p>
                <Stack direction="vertical">
                    <Input placeholder="Current Code" onChange={(e) => setSetupCode(e.target.value)} />
                    <Stack>
                        <Button onClick={() => setSetupData(undefined)} title="Cancel" />
                        <Button onClick={() => enableTotp(setupCode)} title="Setup" />
                    </Stack>
                </Stack>
            </Surface>
        );
    } else if(backupCodes) {
        return (
            <Surface>
                <h1>Backup Codes</h1>
                <p style={{ color: "red" }}>
                    This is the only time they are visible, save them now.
                </p>
                {JSON.parse(backupCodes).map((code: string) => (
                    <p key={code}>{code}</p>
                ))}
                <Button onClick={() => window.open("/", "_self")} title="Done" />
            </Surface>
        );
    } else {
        return (
            <Surface>
                <h1>Two Factor Authentication</h1>
                <p>Status: {enabled ? "Enabled" : "Disabled"}</p>
                {enabled ? (
                    <Button onClick={disableTotp} title="Disable" />
                ) : (
                    <Button onClick={setupTotp} title="Enable" />
                )}
            </Surface>
        );
    }
}

export default TotpPanel;
