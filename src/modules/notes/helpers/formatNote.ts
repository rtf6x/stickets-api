export default function (note: any) {
  return {
    ...note,
    uid: note.uid._id,
    creator: note.uid,
    shared: false,
  }
}
