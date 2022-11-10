import { FC, InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({ ...props }) => {
    return (
        <input {...props} className={styles.input} />
    );
}

export default Input;