import { useState, useEffect, useCallback } from "react";
import { Surface, Stack, Button, Input } from "./components";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./AuthPage.module.css";

interface Props {
    type: "login" | "register"
}

function AuthPage({ type }: Props) {
    const [searchParams] = useSearchParams();

    const [error, setError] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [passwordConfirm, setPasswordConfirm] = useState<string>();
    const [totpCode, setTotpCode] = useState<string>();
    const [totpRequired, setTotpRequired] = useState<boolean>(false);

    const auth = useCallback(() => {
        if(!username || !password) return setError("Username or/and password missing");
        if(type === "register" && password !== passwordConfirm) return setError("Passwords don't match");
        let bodyData: { username: string, password: string, totp: string | undefined } = { username, password, totp: totpCode };
        setError(undefined);
        fetch(`/api/auth/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return setError(data.message);
                if(data.totp) return setTotpRequired(true);
                let date = new Date(data.expires * 1000);
                document.cookie = `nestauth_session=${data.sessionSecret};expires=${date.toUTCString()};domain=.imwux.me;path=/`;
                if(searchParams.get("url"))
                    window.open(searchParams.get("url")?.toString(), "_self");
                else
                    window.open("/", "_self");
            });
    }, [username, password, passwordConfirm, searchParams, type, totpCode]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if(event.key !== "Enter") return;
            event.preventDefault();
            auth();
        }

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [auth]);

    return (
        <div className={styles.container}>
            <Surface style={{ width: "300px" }}>
                <Stack direction="vertical" center>
                    <img className={styles.logo} src="https://host.imwux.me/images/logo-small.png" alt="Logo" />
                    <h1>Nest Login</h1>
                    {error && <p className={styles.error}>{error}</p>}
                    <Input onChange={(e) => setUsername(e.target.value)} placeholder="Username" disabled={totpRequired} style={{ width: "100%" }} />
                    <Input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" disabled={totpRequired} style={{ width: "100%" }} />
                    {totpRequired && <Input onChange={(e) => setTotpCode(e.target.value)} placeholder="Two Factor Code" style={{ width: "100%" }} />}
                    {type === "register" && <Input onChange={(e) => setPasswordConfirm(e.target.value)} type="password" placeholder="Confirm Password" style={{ width: "100%" }} />}
                    <Button onClick={auth} title={type === "login" ? "Login" : "Register"} style={{ width: "100%" }} />
                    {type === "login" ?
                        <Link to="/register" className={styles.footer}>
                            Want to create an account? Register
                        </Link> : <Link to="/login" className={styles.footer}>
                            Already have an account? Login
                        </Link>
                    }
                </Stack>
            </Surface>
        </div>
    );
}

export default AuthPage;