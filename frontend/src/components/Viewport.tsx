import type { PropsWithChildren } from "react";

export default function Viewport({
    children,
}: PropsWithChildren){

    return(

        <div className="nook-viewport">

            {children}

        </div>

    );

}