import { FC, HTMLAttributes } from "react";
import styles from "./Surface.module.css";

const Surface: FC<HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
    return (
        <div {...props} className={styles.surface}>
            {children}
        </div>
    );
}

export default Surface;