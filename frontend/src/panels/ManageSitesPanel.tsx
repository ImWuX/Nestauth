import { useState, useEffect } from "react";
import { Surface } from "../components";
import {
    Paper, Typography, List, ListItem, ListItemText, IconButton, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Site {
    id: number,
    subdomain: string,
    ranks: string[]
}

function ManageSitesPanel() {
    const [sites, setSites] = useState<Site[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editDialogSite, setEditDialogSite] = useState<Site>();
    const [editDialogSubdomain, setEditDialogSubdomain] = useState<string>();
    const [editDialogNewRank, setEditDialogNewRank] = useState<string>("");
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [addDialogSubdomain, setAddDialogSubdomain] = useState<string>();

    function fetchSites() {
        fetch("/api/sites")
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                setSites(data.sites);
            });
    }

    function editSite(site: Site) {
        setEditDialogSite(site);
        setEditDialogOpen(true);
        setEditDialogNewRank("");
    }

    function postEditSite(site: Site, newSubdomain: string | undefined) {
        setEditDialogOpen(false);
        if(site.subdomain === newSubdomain) newSubdomain = undefined;

        fetch("/api/sites/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: site.id, newSubdomain })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchSites();
            });
    }

    function postDeleteSite(site: Site) {
        fetch("/api/sites/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: site.id })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchSites();
            });
    }

    function postAddSite(subdomain: string) {
        setAddDialogOpen(false);
        fetch("/api/sites/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subdomain })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchSites();
            });
    }

    function postAddRank(site: Site, rank: string) {
        setEditDialogOpen(false);
        fetch("/api/sites/ranks/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ siteId: site.id, rank })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchSites();
            });
    }

    function postRemoveRank(site: Site, rank: string) {
        setEditDialogOpen(false);
        fetch("/api/sites/ranks/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ siteId: site.id, rank })
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.error) return console.error(data.message);
                fetchSites();
            });
    }

    useEffect(() => {
        fetchSites();
    }, []);

    return (
        <>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Site</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Subdomain" fullWidth variant="standard"
                        defaultValue={editDialogSite?.subdomain}
                        onChange={(e) => setEditDialogSubdomain(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={() => { if(editDialogSite) postEditSite(editDialogSite, editDialogSubdomain); }}>
                                    <CheckCircleOutlineIcon />
                                </IconButton>
                            )
                        }}
                    />
                    <Paper sx={{padding: "5px", marginTop: "10px"}}>
                        <List>
                        {editDialogSite?.ranks.map((rank: string) => (
                            <ListItem key={rank}>
                                <ListItemText primary={rank} />
                                <IconButton onClick={() => { if(editDialogSite) postRemoveRank(editDialogSite, rank); }}><DeleteIcon /></IconButton>
                            </ListItem>
                        ))}
                        </List>
                        <TextField sx={{margin: "5px"}} label="New Rank" variant="standard"
                            onChange={(e) => setEditDialogNewRank(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                <IconButton onClick={() => { if(editDialogSite) postAddRank(editDialogSite, editDialogNewRank); }}>
                                    <AddCircleOutlineIcon />
                                </IconButton>
                                )
                            }}
                        />
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>New Site</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Subdomain" fullWidth variant="standard"
                        onChange={(e) => setAddDialogSubdomain(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { if(addDialogSubdomain) postAddSite(addDialogSubdomain); }}>Submit</Button>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Surface>
                <Typography variant="h5">Sites</Typography>
                <List>
                {sites.map((site: Site) => (
                    <ListItem key={site.id}>
                        <ListItemText primary={site.subdomain} secondary={site.ranks.join(", ")} />
                        <IconButton onClick={() => editSite(site)}><EditIcon /></IconButton>
                        <IconButton onClick={() => postDeleteSite(site)} sx={{color: "#e61717"}}><DeleteIcon /></IconButton>
                    </ListItem>
                ))}
                </List>
                <Button onClick={() => setAddDialogOpen(true)}>Add</Button>
            </Surface>
        </>
    );

}

export default ManageSitesPanel;