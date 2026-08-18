import { useState } from "react";

export default function useCamera() {

    const [camera] = useState({
        x: 0,
        y: 0,
        zoom: 1,
    });

    return camera;

}