

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Note {
    struct NoteStruct {
        uint256 id;
        string content;
        address owner;
    }
    address private _owner;

    NoteStruct[] public notes;
    NoteStruct private emptyNote;

    mapping(address => uint256[]) public userNotes;

    constructor () {
        _owner = msg.sender;
    }

    function createNote(string memory _content) public {
        uint256 noteId = notes.length;
        notes.push(NoteStruct(noteId, _content, msg.sender));
        userNotes[msg.sender].push(noteId);
    }

    function getNotesByUser(address _user) public view returns (NoteStruct[] memory) {
        uint256[] memory noteIds = userNotes[_user];
        NoteStruct[] memory userNotesArray = new NoteStruct[](noteIds.length);
        for (uint256 i = 0; i < noteIds.length; i++) {
                userNotesArray[i] = notes[noteIds[i]];        
        }
        return userNotesArray;
    }

    function getNoteById(uint256 _id) public view returns (NoteStruct memory) {
        for (uint256 i = 0; i < notes.length; i++) {
            if (notes[i].id == _id && msg.sender == notes[i].owner) {
                return notes[i];
            }
        }
        return emptyNote;
     }

    function updateNote(uint256 _id, string memory _content) public {
        require(notes[_id].owner == msg.sender, "Only the owner can update the note");
        notes[_id].content = _content;
    }

    function deleteNote(uint256 _id) public {
        require(notes[_id].owner == msg.sender, "Only the owner can delete the note");
        // Remove the note from the notes array
        for (uint256 i = _id; i < notes.length - 1; i++) {
            notes[i] = notes[i + 1];
        }
        notes.pop();
        // Remove the note from the user's notes array
        uint256[] storage userNotesArray = userNotes[msg.sender];
        for (uint256 i = 0; i < userNotesArray.length; i++) {
            if (userNotesArray[i] == _id) {
                userNotesArray[i] = userNotesArray[userNotesArray.length - 1];
                userNotesArray.pop();
                break;
            }
        }
    }
}
