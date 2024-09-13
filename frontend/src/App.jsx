// import { AuthProvider } from "./authentication/AuthContext";
import { useRoutes, Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";

// layouts and pages
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import Create from './pages/Create'
import Profile from './pages/Profile'
import Login from './authentication/Login'
import Register from './authentication/Register'

// function App() {
//   const routesArray = [
//     {
//       path: "*",
//       element: <Login />,
//     },
//     {
//       path: "/login",
//       element: <Login />,
//     },
//     {
//       path: "/register",
//       element: <Register />,
//     },
//     {
//       path: "/dashboard",
//       element: <Dashboard />,
//     },
//     {
//       path: "/create",
//       element: <Create />,
//     },
//     {
//       path: "/profile",
//       element: <Profile />,
//     },
//   ];
//   let routesElement = useRoutes(routesArray);
//   return (
//     <AuthProvider>
//       <Header />
//       <div className="w-full h-screen flex flex-col my-20">{routesElement}</div>
//     </AuthProvider>
//   );
// }

// export default App;


// router and routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <>

      <Route path="/" element={<RootLayout />}>
        <Route index path="/signup" element={<Register />} />
        <Route path="/signin" element={<Login />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/create"
          element={<Create />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>


      {/* <Route path="/" element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="create" element={<Create />} />
        <Route path="profile" element={<Profile />} />
      </Route> */}
    </>
  )
)



function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
