import { FC, ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
}

const Button: FC<ButtonProps> = ({ title, ...props }) => {
    return (
        <button {...props} className={styles.button}>
            {title}
        </button>
    );
}

export default Button;