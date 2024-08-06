'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, TextField, Stack, Typography, Button } from "@mui/material";
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
            bgcolor='#FFFDD0'
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
        >
            <Box
                sx={{
                    width: 800,
                    height: 500,
                    border: "4px solid #333",
                    fontSize: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: '#2B3C4D',
                    color: '#B9D0F0',
                    '&:hover': {
                        transitionDelay: '0.3s',
                        boxShadow: '0 0 20px #2F2C34, 0 0 50px #2F2C34, 0 0 90px #2F2C34',
                    },
                }}
            > Welcome to the Inventory Tracker! </Box>

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
            <Box border="3px solid #333">
                <Box
                    width="800px"
                    height="100px"
                    bgcolor="#ADD8E6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography variant="h2" colors="#333">
                        Inventory Items
                    </Typography>
                </Box>
                <Stack width="800px" height="300px" spacing={2} overflow="auto">
                    {filteredInventory.map(({ name, quantity }) => (
                        <Box
                            key={name}
                            width="100%"
                            minHeight="150px"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            bgcolor="#f0f0f0"
                            padding={5}
                        >
                            <Typography variant="h3" color="#333" textAlign="center">
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </Typography>
                            <Typography variant="h3" color="#333" textAlign="center">
                                {quantity}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={() => {
                                    addItem(name)
                                }}> Add
                                </Button>
                                <Button variant="contained" onClick={() => {
                                    removeItem(name)
                                }}> Remove
                                </Button>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box >
    )
}