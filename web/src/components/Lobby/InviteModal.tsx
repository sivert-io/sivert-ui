import { Modal } from "../Modal";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function InviteModal({ open, setOpen }: InviteModalProps) {
  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="space-y-4 text-primary">
        <h2 className="text-xl font-semibold">Invite players</h2>
        <div></div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button
            onClick={() => {
              console.log("invite");
              setOpen(false);
            }}
          >
            Send invite
          </button>
        </div>
      </div>
    </Modal>
  );
}
