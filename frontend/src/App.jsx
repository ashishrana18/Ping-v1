import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginPage.jsx";
import RegisterPage from "./pages/registerPage.jsx";
import ChatPage from "./pages/chatPage.jsx";
import { AuthProvider } from "./services/authContext.jsx";
import NewChatPage from "./pages/newChatPage.jsx";
import Heartbeat from "./components/chat/heartBeat.jsx";
import SecretChatPage from "./components/secretChat/SecretChatPage.jsx";
import NoPageFound from "./components/chat/noPageFound.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Heartbeat />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/new-chat" element={<NewChatPage />} />
          {/* <Route path="/secretChat" element={<SecretChatPage />} /> */}

          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
