import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../lib/api";

interface ActionHandlerParams {
  route: string;
  body?: any;
  refetch?: () => void;
  callBacks?: (() => void)[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  type?: "post" | "patch" | "delete" | "put" | "get";
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

const useActionHandler = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const action = useMutation({
    mutationFn: async ({ route, body }: { route: string; body: any }) => {
      const res = await apiClient.post(route, body);
      return res.data;
    },
  });

  const actionPatch = useMutation({
    mutationFn: async ({ route, body }: { route: string; body: any }) => {
      const res = await apiClient.patch(route, body);
      return res.data;
    },
  });

  const actionPut = useMutation({
    mutationFn: async ({ route, body }: { route: string; body: any }) => {
      const res = await apiClient.put(route, body);
      return res.data;
    },
  });

  const actionDelete = useMutation({
    mutationFn: async ({ route, body }: { route: string; body?: any }) => {
      const res = await apiClient.delete(
        route,
        body ? { data: body } : undefined,
      );
      return res.data;
    },
  });

  const actionGet = useMutation({
    mutationFn: async ({ route, params }: { route: string; params?: any }) => {
      const res = await apiClient.get(route, { params });
      return res.data;
    },
  });

  const handleAction = async ({
    route,
    body,
    refetch,
    callBacks,
    onSuccess,
    onError,
    type = "post",
    showToast = true,
    successMessage,
    errorMessage,
  }: ActionHandlerParams) => {
    const extractErrorMessage = (error: any): string => {
      if (error?.response?.data?.message) {
        return error.response.data.message;
      } else if (error?.response?.data?.error) {
        return error.response.data.error;
      } else if (error?.message) {
        return error.message;
      }
      return errorMessage || "An error occurred";
    };

    const handleSuccess = (data: any) => {
      setData(data);
      setError(null);

      callBacks?.forEach((callback) => callback());
      refetch?.();

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(data);
    };

    const handleError = (error: any) => {
      const errorMessageStr = extractErrorMessage(error);
      console.error("Action failed:", errorMessageStr);
      setError(errorMessageStr);

      if (showToast) {
        toast.error(errorMessageStr);
      }

      onError?.(errorMessageStr);
    };

    try {
      let result;
      if (type === "post") {
        result = await action.mutateAsync({ route, body: body || {} });
      } else if (type === "patch") {
        result = await actionPatch.mutateAsync({ route, body: body || {} });
      } else if (type === "put") {
        result = await actionPut.mutateAsync({ route, body: body || {} });
      } else if (type === "get") {
        result = await actionGet.mutateAsync({ route, params: body });
      } else {
        result = await actionDelete.mutateAsync({ route, body: body || {} });
      }
      handleSuccess(result);
    } catch (error: any) {
      handleError(error);
    }
  };

  return {
    handleAction,
    action,
    actionPatch,
    actionPut,
    actionDelete,
    data,
    error,
    isLoading:
      action.isPending ||
      actionPatch.isPending ||
      actionPut.isPending ||
      actionDelete.isPending ||
      actionGet.isPending,
  };
};

export default useActionHandler;
