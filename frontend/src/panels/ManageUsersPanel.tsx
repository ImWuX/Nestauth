import { useState, useEffect } from "react";
import { Surface } from "../components";
import {
    Typography, List, ListItem, ListItemText, IconButton, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
    id: number,
    username: string,
    rank: string
}

function ManageUsersPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editDialogUser, setEditDialogUser] = useState<User>();
    const [editDialogName, setEditDialogName] = useState<string>();
    const [editDialogRank, setEditDialogRank] = useState<string>();

    function fetchUsers() {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                setUsers(data.users);
            });
    }

    function editUser(user: User) {
        setEditDialogUser(user);
        setEditDialogOpen(true);
    }

    function postEditUser(user: User, newName: string | undefined, newRank: string | undefined) {
        setEditDialogOpen(false);
        if(user.username === newName) newName = undefined;
        if(user.rank === newRank) newRank = undefined;

        fetch("/api/users/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, newName, newRank })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchUsers();
            });
    }

    function postDeleteUser(userId: number) {
        fetch("/api/users/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchUsers();
            });
    }
    
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Username" fullWidth variant="standard"
                        defaultValue={editDialogUser?.username}
                        onChange={(e) => setEditDialogName(e.target.value)}
                    />
                    <TextField margin="dense" label="Rank" fullWidth variant="standard"
                        defaultValue={editDialogUser?.rank}
                        onChange={(e) => setEditDialogRank(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { if(editDialogUser) postEditUser(editDialogUser, editDialogName, editDialogRank); }}>Submit</Button>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Surface>
                <Typography variant="h5">Users</Typography>
                <List>
                    {users.map((user) => (
                        <ListItem key={user.id}>
                            <ListItemText primary={user.username} secondary={user.rank} />
                            <IconButton onClick={() => editUser(user)}><EditIcon /></IconButton>
                            <IconButton onClick={() => postDeleteUser(user.id)} sx={{color: "#e61717"}}><DeleteIcon /></IconButton>
                        </ListItem>
                    ))}
                </List>
            </Surface>
        </>
    );

}

export default ManageUsersPanel;