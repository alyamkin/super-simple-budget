import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rowAdded } from "@/features/budget/budgetSlice";
import { selectPickedCount } from "@/features/budget/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { StoreProvider } from "@/store/StoreProvider";

function Probe() {
  const count = useAppSelector((state) => selectPickedCount(state, "home"));
  const dispatch = useAppDispatch();
  return (
    <button onClick={() => dispatch(rowAdded({ itemId: "rent" }))}>
      {count} picked
    </button>
  );
}

describe("StoreProvider", () => {
  it("provides a store that starts empty", async () => {
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    );
    const button = screen.getByRole("button", { name: "0 picked" });
    await userEvent.click(button);
    expect(button).toHaveTextContent("1 picked");
  });

  it("gives every provider its own store", async () => {
    render(
      <>
        <StoreProvider>
          <Probe />
        </StoreProvider>
        <StoreProvider>
          <Probe />
        </StoreProvider>
      </>,
    );
    const [first, second] = screen.getAllByRole("button");
    await userEvent.click(first);
    expect(first).toHaveTextContent("1 picked");
    expect(second).toHaveTextContent("0 picked");
  });
});
