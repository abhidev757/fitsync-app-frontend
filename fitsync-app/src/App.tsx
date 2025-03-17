import './App.css'
import {Outlet} from 'react-router-dom'
import { ToastContainer } from "react-toastify";

function App() {

  return (
    <>
     {/* Global Toast Settings */}
     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '8px',
        }}
      />
    <Outlet/>
    </>
  )
}

export default App
