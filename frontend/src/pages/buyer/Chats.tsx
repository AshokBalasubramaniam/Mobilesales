import { Navigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

const Chats = () => <Navigate to={PATHS.chat} replace />;

export default Chats;
