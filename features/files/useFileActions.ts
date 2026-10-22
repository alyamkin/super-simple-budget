import { STEPS } from "@/domain/catalog/buckets";
import { budgetReplaced, budgetSlice } from "@/features/budget/budgetSlice";
import {
  fileOpened,
  fileSaved,
  toastShown,
  uiSlice,
} from "@/features/wizard/uiSlice";
import { useGoToStep } from "@/features/wizard/useGoToStep";
import { useTranslator } from "@/i18n/I18nProvider";
import { downloadFile } from "@/lib/download";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { budgetCsv } from "./exportCsv";
import { serializeBudget } from "./exportJson";
import { fileName } from "./fileName";
import { readBudgetFile } from "./importJson";

const { selectBudget } = budgetSlice.selectors;
const { selectView } = uiSlice.selectors;

const RESULTS = STEPS.length - 1;

/**
 * Save, export and open (Spec §11), each ending with a toast. They read the
 * store when called, so components using them don't re-render on edits.
 */
export function useFileActions() {
  const translator = useTranslator();
  const { t, locale } = translator;
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const goToStep = useGoToStep();

  const download = (extension: string, content: string, mime: string) => {
    const saved = downloadFile(
      fileName(t("files.fileBase"), extension),
      content,
      mime,
    );
    if (!saved) dispatch(toastShown({ key: "noDownload" }));
    return saved;
  };

  /** Saves the JSON backup; returns whether the download started. */
  const save = (): boolean => {
    const state = store.getState();
    const json = serializeBudget(selectBudget(state), {
      locale,
      view: selectView(state),
      itemLabel: (id) => t(`items.${id}.label`),
    });
    if (!download("json", json, "application/json")) return false;
    dispatch(fileSaved());
    dispatch(toastShown({ key: "backupSaved" }));
    return true;
  };

  /** The spreadsheet is for viewing only, so it doesn't count as saved. */
  const exportCsv = () => {
    const csv = budgetCsv(translator, selectBudget(store.getState()));
    if (download("csv", csv, "text/csv;charset=utf-8")) {
      dispatch(toastShown({ key: "csvSaved" }));
    }
  };

  /** Replaces the budget with the file's and shows its results. */
  const open = async (file: Blob) => {
    const result = await readBudgetFile(file);
    if (!result.ok) {
      dispatch(toastShown({ key: result.error }));
      return;
    }
    dispatch(budgetReplaced(result.budget));
    dispatch(fileOpened(result.view));
    goToStep(RESULTS);
    dispatch(toastShown({ key: "opened" }));
  };

  return { save, exportCsv, open };
}
