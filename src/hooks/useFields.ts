import { useCallback, useEffect, useState } from "react";
import { fetchFields, subscribeFieldRealtime } from "@/src/services/fieldService";
import { useAppStore } from "@/src/store/appStore";
import { FieldWithRelations } from "@/src/types/domain";

type UseFieldsResult = {
  fields: FieldWithRelations[];
  loading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

export function useFields(): UseFieldsResult {
  const sampleFields = useAppStore((state) => state.sampleFields);
  const [fields, setFields] = useState<FieldWithRelations[]>(sampleFields);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextFields = await fetchFields();
      setFields(nextFields.length > 0 ? nextFields : sampleFields);
    } catch (error) {
      const message = error instanceof Error ? error.message : "필지 정보를 불러오지 못했습니다.";
      setErrorMessage(message);
      setFields(sampleFields);
    } finally {
      setLoading(false);
    }
  }, [sampleFields]);

  useEffect(() => {
    refresh();
    return subscribeFieldRealtime(refresh);
  }, [refresh]);

  useEffect(() => {
    if (errorMessage) {
      setFields(sampleFields);
    }
  }, [errorMessage, sampleFields]);

  return { fields, loading, errorMessage, refresh };
}
