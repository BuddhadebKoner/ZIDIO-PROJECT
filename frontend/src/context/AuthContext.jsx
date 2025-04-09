const { createContext } = require("react");

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [currentUser, setCurrentUser] = useState(null);
   const [serverStatus, setServerStatus] = useState({ isRunning: true, message: null });
};