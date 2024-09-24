import React, { useEffect, useState } from "react";
import { Container, Typography, ListItemText, ListItem, Button, Skeleton, Input } from "@mui/material";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useDecimals from "src/hooks/useDecimals";
import { getContract } from "wagmi/actions";

import { awaitTransaction, toEth } from "src/utils/common";
import { NoteAbi } from "src/assets/abis/note";
import { decryptSymmetric, encryptSymmetric } from "src/utils/encrypt";

interface IProps {}

const Home: React.FC<IProps> = () => {
  const { balance, currentAddress, walletClient } = useWallet();
  const { balances, isLoading, isFetching } = useBalances();
  const { decimals } = useDecimals();
  const [note, setNote] = useState("");
  const [userNotes, setUserNote] = useState([]);
  const [signature, setSignature] = useState('');

  const contract = getContract({
    abi: NoteAbi,
    walletClient,
    address: "0xd9894BE433911D322d21A7d4478E304204657c77",
  });


  const signInitKey = async () => {
    walletClient?.signMessage({
      message: 'WELCOME_TO'
    }).then((s) => {
      console.log('-----------------------,', s)
      setSignature(s)
    }).catch(e => {
      console.log('error------------', e)
    })
  }

  const fetchNotes = async () => {
    const notes: any = await contract.read.getNotesByUser([currentAddress]);
    const decoded: any = await Promise.all(notes.map(async (note: any) => {
      try {
        const plantext = await decryptSymmetric(note?.content, signature)
        return {
          ...note,
          plantext
        }
      } catch (_) {
        return note
      }
      
    }))
    setUserNote(decoded);
  };

  useEffect(() => {
    if (currentAddress && walletClient) {
      signInitKey();
    } else {
      setUserNote([]);
    }
  }, [currentAddress, walletClient]);

  useEffect(() => {
    if (signature) {
      fetchNotes();
    }
  }, [signature])

  const createNote = async () => {
    if (!signature) {
      signInitKey()
      return;
    }
    const cipher = await encryptSymmetric(note, signature)
    await awaitTransaction(contract.write.createNote([cipher]));
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
      {userNotes?.map((note: any) => (
        <div key={note.id}>{note.plantext || note.content}</div>
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

