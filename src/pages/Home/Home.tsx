import React, { useEffect, useState } from "react";
import { Container, Typography, ListItemText, ListItem, Button, Skeleton, Input } from "@mui/material";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useDecimals from "src/hooks/useDecimals";
import { getContract } from "wagmi/actions";

import { awaitTransaction, toEth } from "src/utils/common";
import { NoteAbi } from "src/assets/abis/note";

interface IProps {}

const Home: React.FC<IProps> = () => {
  const { balance, displayAccount, currentAddress, walletClient } = useWallet();
  const { balances, isLoading, isFetching } = useBalances();
  const { decimals } = useDecimals();
  const [note, setNote] = useState("");
  const [userNotes, setUserNote] = useState([]);

  const contract = getContract({
    address: "0x635bfAC122305Abf6Aaa30535b41e9A2062ab7E1",
    abi: NoteAbi,
    walletClient,
  });

  const fetchNotes = async () => {
    const notes: any = await contract.read.getNotesByUser([currentAddress]);
    setUserNote(notes);
  };

  useEffect(() => {
    if (currentAddress) {
      fetchNotes();
    } else {
      setUserNote([]);
    }
  }, [currentAddress]);

  const createNote = async () => {
    await awaitTransaction(contract.write.createNote([note]));
    setNote("");
    fetchNotes();
  };

  return (
    <Container maxWidth="xl">
      <h1>Root Page</h1>
      <Typography>
        <b>Balance:</b> {balance?.formatted}
      </Typography>
      <Typography>
        <b>Current Wallet:</b> {currentAddress}
      </Typography>
      <Typography>
        <b>Current Wallet:</b> {displayAccount}
      </Typography>
      {balances &&
        !isLoading &&
        Object.entries(balances).map(([address, balance]) => (
          <ListItem key={address}>
            <ListItemText>
              <b>Address:</b> {address} <b>Balance:</b> {toEth(balance, decimals && decimals[address])}
            </ListItemText>
          </ListItem>
        ))}
      {isFetching && <Skeleton height={200} />}
      <br />
      <br />
      {userNotes?.map((non: any) => (
        <div>{non?.content}</div>
      ))}
      <br />
      <Input value={note} className="w-100" onChange={(e) => setNote(e.target.value)} />
      <Button variant="outlined" onClick={createNote}>
        Create Note
      </Button>
    </Container>
  );
};

export default Home;

