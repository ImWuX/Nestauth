import { useState, useEffect } from "react";
import { Surface, Button } from "./components";
import { useNavigate } from "react-router-dom";
import { logoUrl } from "./config";
import styles from "./PortalPage.module.css";

import TotpPanel from "./panels/TotpPanel";
import ManageUsersPanel from "./panels/ManageUsersPanel";
import ManageSitesPanel from "./panels/ManageSitesPanel";

interface PortalData {
    error: boolean,
    auth: boolean,
    isAdmin: boolean,
    session: {
        ip: string,
        expires: number,
    },
    user: {
        username: string,
        rank: string
    },
    totp: {
        enabled: boolean
    }
}

function PortalPage() {
    const [portalData, setPortalData] = useState<PortalData>();
    const navigate = useNavigate();

    function logout() {
        fetch("/api/auth/logout", { method: "POST" })
            .then(() => window.open("/", "_self"));
    }

    useEffect(() => {
        fetch("/api/auth/state")
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                if(!data.auth) return navigate("/login");
                setPortalData(data);
            });
    }, [navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={logoUrl} alt="Logo" />
                <h1>Nest Authentication Portal</h1>
            </div>
            {portalData &&
                <>
                    <Surface>
                        <h1>{portalData.user.username}</h1>
                        <p>Connected from {portalData.session.ip}</p>
                        <p>Expires {new Date(1000 * portalData.session.expires).toString()}</p>
                        <Button onClick={logout} title="Logout" />
                    </Surface>
                    <TotpPanel enabled={portalData.totp.enabled} />
                    {portalData.isAdmin && <ManageSitesPanel />}
                    {portalData.isAdmin && <ManageUsersPanel />}
                </>
            }
        </div>
    );

}

export default PortalPage;