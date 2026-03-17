import { HiMiniSquares2X2 } from "react-icons/hi2";
import { FaCreditCard } from "react-icons/fa6";
import { FaCog } from "react-icons/fa";
import { BsFillClipboard2Fill } from "react-icons/bs";

export const menus = [
    {
        name: 'My Profile',
        icon: (isActive) => {
            return (
                <div className={isActive ? "text-navy-dark" : "text-gray-light"}>
                 <HiMiniSquares2X2 size={24}/>
                </div>
            )
        },
        path: '/dashboard'
    },
    {
        name: 'Vacancies',
        icon: (isActive) => {
            return (
                <div className={isActive ? "text-navy-dark" : "text-gray-light"}>
                 <FaCreditCard size={24}/>
                </div>
            )
        },
        path: '/vacancies'
    },
    {
        name: 'Administrative Services',
        icon: (isActive) => {
            return (
                <div className={isActive ? "text-navy-dark" : "text-gray-light"}>
                 <BsFillClipboard2Fill size={24}/>
                </div>
            )
        },
        path: '/administrative-services'
    },
    {
        name: 'Settings',
        icon: (isActive) => {
            return (
                <div className={isActive ? "text-navy-dark" : "text-gray-light"}>
                 <FaCog size={24}/>
                </div>
            )
        },
        path: '/settings'
    }
]