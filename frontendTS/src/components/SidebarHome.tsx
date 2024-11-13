import { List, ListItem, ListIcon, Divider } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"
import { IoIosImages, IoIosCreate, IoMdContact } from "react-icons/io";


const SidebarHome = () => {
  return (
        <List color="white" fontSize="1.2em" spacing={2}>
            <ListItem>
                <NavLink to="/dashboard">
                    <ListIcon as={IoIosImages} />
                    Dashboard
                </NavLink>
            </ListItem>
            <ListItem>
                <NavLink to="/create">
                    <ListIcon as={IoIosCreate} />
                    Create
                </NavLink>
            </ListItem>
            <ListItem>
                <NavLink to="/profile">
                    <ListIcon as={IoMdContact} />
                    Profile
                </NavLink>
            </ListItem>
            <Divider />
        </List>
    )
}

export default SidebarHome