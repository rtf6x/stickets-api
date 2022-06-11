export default function (user: any) {
  return function (note: any) {
    return {
      ...note,
      uid: note.uid._id,
      creator: note.uid,
      shared: note.uid._id.toString() !== user._id.toString(),
    }
  }
}
