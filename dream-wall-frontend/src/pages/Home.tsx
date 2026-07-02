import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Home(){
    const navigate = useNavigate();
    return <>
    <h1>Dream Wall</h1>
    <button onClick={() => {logout(); navigate("/")}}>logout</button>
    </>;
}