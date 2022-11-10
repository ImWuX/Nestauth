import { FC, HTMLAttributes } from "react";
import styles from "./Stack.module.css";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
    direction?: "horizontal" | "vertical";
    center?: boolean;
}

const Surface: FC<StackProps> = ({ children, direction, center, ...props }) => {
    return (
        <div {...props} className={styles.stack} style={{ flexDirection: direction == "vertical" ? "column" : "row", alignItems: center ? "center" : "initial" }}>
            {children}
        </div>
    );
}

export default Surface;