'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, TextField, Stack, Typography, Button, TableHead, Table, TableRow, TableCell, TableContainer, Paper, TableBody } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";


export default function Home() {
    const [open, setOpen] = useState(false)
    const [inventory, setInventory] = useState([])
    const [itemName, setItemName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const updateInventory = async () => {
        const snapshot = query(collection(firestore, 'inventory'))
        const docs = await getDocs(snapshot)
        const inventoryList = []
        docs.forEach((doc) => {
            inventoryList.push({
                name: doc.id,
                ...doc.data()
            })
        })
        setInventory(inventoryList)
    }

    const addItem = async (item) => {
        const capitalItem = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
        const docRef = doc(collection(firestore, 'inventory'), capitalItem)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            await setDoc(docRef, { quantity: quantity + 1 })
        } else {
            await setDoc(docRef, { quantity: 1 })
        }
        await updateInventory()
    }

    const removeItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            if (quantity === 1) {
                await deleteDoc(docRef)
            } else {
                await setDoc(docRef, { quantity: quantity - 1 })
            }
        }
        await updateInventory()
    }

    useEffect(() => {
        updateInventory()
    }, [])

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const filteredInventory = inventory.filter(({ name }) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Box
            width="100vw"
            height="100vh"
            bgcolor='#FFFFFF'
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
        >
            <Modal open={open} onClose={handleClose}>
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    width={400}
                    bgcolor="white"
                    border="3px solid #333"
                    boxShadow={24}
                    p={4}
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    sx={{
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <Typography variant="h6"> Add Item </Typography>
                    <Stack width="100%" direction="row" spacing={2}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={itemName}
                            onChange={(e) => {
                                setItemName(e.target.value)
                            }}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => {
                                addItem(itemName)
                                setItemName('')
                                handleClose()
                            }}
                        > Add </Button>
                    </Stack>
                </Box>
            </Modal>
            <Button
                variant="contained"
                onClick={() => {
                    handleOpen()
                }}
            >
                Add New Item
            </Button>
            <TextField
                label="Search Item Here"
                variant="outlined"
                size="normal"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value)
                }}

            />
            <TableContainer component={Paper} sx={{
                width: '100%',
                height: '100%',
                border: "3px solid #210F31",
                marginTop: 2,
            }}>
                <Table sx={{
                    width: '100%',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: '#210F31',
                }} aria-label="iventory table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }} >Item</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }} align="right">Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }} align="right">Add</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }} align="right">Remove</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInventory.map(({ name, quantity }) => (
                            <TableRow key={name}>
                                <TableCell component='th' scope="row">
                                    {name.charAt(0).toUpperCase() + name.slice(1)}
                                </TableCell>
                                <TableCell align="right">
                                    {quantity}
                                </TableCell>
                                <TableCell align="right">
                                    <Button bgcolor="#7E337F" variant="contained" onClick={() => { addItem(name) }}>
                                        Add
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    <Button bgcolor="#7E337F" variant="contained" onClick={() => { removeItem(name) }}>
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box >
    )
}