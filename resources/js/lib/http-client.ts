type UploadProgressEvent = {
    loaded: number;
    total: number;
};

type RequestOptions = {
    data?: unknown;
    headers?: Record<string, string>;
    onUploadProgress?: (event: UploadProgressEvent) => void;
};

type HttpResponse<T> = { data: T };

type HttpError = Error & {
    isHttpError: true;
    response?: { data?: { message?: unknown }; status: number };
};

const csrfToken = (): string | null =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? null;

const request = async <T>(
    url: string,
    method: 'POST' | 'DELETE',
    data?: unknown,
    options: RequestOptions = {},
): Promise<HttpResponse<T>> => {
    const payload = data ?? options.data;
    const isFormData = payload instanceof FormData;
    const token = csrfToken();

    options.onUploadProgress?.({ loaded: 0, total: 1 });
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            ...(!isFormData && payload
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...(isFormData
                ? Object.fromEntries(
                      Object.entries(options.headers ?? {}).filter(
                          ([name]) => name.toLowerCase() !== 'content-type',
                      ),
                  )
                : options.headers),
        },
        body: payload
            ? isFormData
                ? payload
                : JSON.stringify(payload)
            : undefined,
    });
    const responseData: unknown = await response.json().catch(() => null);
    options.onUploadProgress?.({ loaded: 1, total: 1 });

    if (!response.ok) {
        const error = Object.assign(new Error('Request failed.'), {
            isHttpError: true as const,
            response: {
                data:
                    typeof responseData === 'object' && responseData !== null
                        ? (responseData as { message?: unknown })
                        : undefined,
                status: response.status,
            },
        });
        throw error;
    }

    return { data: responseData as T };
};

const httpClient = {
    post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
        request<T>(url, 'POST', data, options),
    delete: <T>(url: string, options?: RequestOptions) =>
        request<T>(url, 'DELETE', undefined, options),
    isAxiosError: (error: unknown): error is HttpError =>
        typeof error === 'object' &&
        error !== null &&
        'isHttpError' in error &&
        (error as { isHttpError?: unknown }).isHttpError === true,
};

export default httpClient;
