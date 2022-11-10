import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";
import App from "./App";
import "./index.css";

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        login: true;
        register: true;
        red: true;
        purple: true;
    }
}

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiButton: {
            variants: [
                {
                    props: { variant: "login" },
                    style: {
                        backgroundColor: "#22b33b",
                        "&:hover": { backgroundColor: "#1b802c" }
                    }
                },
                {
                    props: { variant: "register" },
                    style: {
                        backgroundColor: "#4287f5",
                        "&:hover": { backgroundColor: "#1968e6" }
                    }
                },
                {
                    props: { variant: "red" },
                    style: {
                        backgroundColor: "#e61717",
                        "&:hover": { backgroundColor: "#a60d0d" }
                    }
                },
                {
                    props: { variant: "purple" },
                    style: {
                        backgroundColor: "#492696",
                        "&:hover": { backgroundColor: "#321278" }
                    }
                }
            ]
        }
    }
});

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
);