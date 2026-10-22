import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

function Confirm({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose();
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Clear budget</Button>
      <Dialog open={open} onClose={close} aria-labelledby="confirm-title">
        <h3 id="confirm-title">Clear your budget?</h3>
        <Button variant="primary" onClick={close}>
          Continue without saving
        </Button>
        <Button onClick={close}>Cancel</Button>
      </Dialog>
    </>
  );
}

const openDialog = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Clear budget" }));
  return screen.getByRole("dialog", { name: "Clear your budget?" });
};

describe("Dialog", () => {
  it("is closed until opened", () => {
    render(<Confirm />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a named modal and focuses its first action", async () => {
    render(<Confirm />);
    const dialog = await openDialog();
    expect(dialog).toHaveAttribute("open");
    expect(
      screen.getByRole("button", { name: "Continue without saving" }),
    ).toHaveFocus();
  });

  it("closes from an action and returns focus to the opener", async () => {
    const onClose = jest.fn();
    render(<Confirm onClose={onClose} />);
    await openDialog();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear budget" })).toHaveFocus();
    expect(onClose).toHaveBeenCalled();
  });

  it("reports a close the dialog made itself (Esc)", async () => {
    const onClose = jest.fn();
    render(<Confirm onClose={onClose} />);
    const dialog = (await openDialog()) as HTMLDialogElement;
    dialog.close();
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Clear budget" })).toHaveFocus();
  });

  it("closes when unmounted while open", async () => {
    const { unmount } = render(<Confirm />);
    const dialog = (await openDialog()) as HTMLDialogElement;
    unmount();
    expect(dialog.open).toBe(false);
  });

  it("has no axe violations when open", async () => {
    const { container } = render(<Confirm />);
    await openDialog();
    expect(await axe(container)).toHaveNoViolations();
  });
});
