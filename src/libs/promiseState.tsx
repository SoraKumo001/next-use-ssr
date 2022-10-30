import { ReactNode, useContext, useId, useRef, useState, createContext, Suspense } from 'react';

const DATA_NAME = '__NEXT_DATA_PROMISE__';

type ContextType = {
  values: { [key: string]: unknown };
  promises: Promise<unknown>[];
  finished: boolean;
};
const promiseContext = createContext<ContextType>(undefined as never);

export const usePromiseState = <T,>(p: Promise<T> | (() => Promise<T>)) => {
  const context = useContext(promiseContext);
  const id = useId();
  const [state, setState] = useState<Promise<T>>(() => {
    if (typeof window === 'undefined') {
      const promise = typeof p === 'function' ? p() : p;
      context.promises.push(promise);
      promise.then((v) => {
        context.values[id] = v;
      });
      return promise;
    }
    return context.values[id]
      ? Promise.resolve(context.values[id] as T)
      : typeof p === 'function'
        ? p()
        : p;
  });
  return [state, setState] as const;
};

const DataRender = () => {
  const context = useContext(promiseContext);
  if (typeof window === 'undefined' && !context.finished)
    throw Promise.all(context.promises).then((v) => {
      context.finished = true;
      return v;
    });
  return (
    <script
      id={DATA_NAME}
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(context.values) }}
    />
  );
};

const useContextValue = () => {
  const refContext = useRef<ContextType>({ values: {}, promises: [], finished: false });
  if (typeof window !== 'undefined' && !refContext.current.finished) {
    const node = document.getElementById(DATA_NAME);
    if (node) refContext.current.values = JSON.parse(node.innerHTML);
    refContext.current.finished = true;
  }
  return refContext.current;
};

export const PromiseProvider = ({ streaming, children }: { streaming?: boolean, children: ReactNode }) => {
  const value = useContextValue();
  return (
    <promiseContext.Provider value={value}>
      {children}
      {streaming ? <Suspense><DataRender /></Suspense> : <DataRender />}
    </promiseContext.Provider>
  );
};
