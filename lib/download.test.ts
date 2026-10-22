import { downloadFile } from "./download";

describe("downloadFile", () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let click: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    createObjectURL = jest.fn(() => "blob:budget");
    revokeObjectURL = jest.fn();
    // jsdom has no object URLs.
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    click.mockRestore();
    jest.useRealTimers();
  });

  it("clicks a temporary download link for the content", async () => {
    let attached = false;
    click.mockImplementation(() => {
      attached = document.querySelector("a") !== null;
    });

    expect(downloadFile("my-budget.json", "{}", "application/json")).toBe(true);

    const blob: Blob = createObjectURL.mock.calls[0][0];
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(blob.type).toBe("application/json");
    await expect(blob.text()).resolves.toBe("{}");
    expect(link.download).toBe("my-budget.json");
    expect(link.getAttribute("href")).toBe("blob:budget");
    expect(attached).toBe(true);
    expect(document.querySelector("a")).toBeNull();
  });

  it("revokes the object URL once the click is handled", () => {
    downloadFile("a.csv", "x", "text/csv");
    expect(revokeObjectURL).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:budget");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("reports when downloads aren't possible", () => {
    createObjectURL.mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(downloadFile("a.csv", "x", "text/csv")).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("still revokes the URL when the click fails", () => {
    click.mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(downloadFile("a.csv", "x", "text/csv")).toBe(false);
    expect(document.querySelector("a")).toBeNull();
    jest.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:budget");
  });
});
