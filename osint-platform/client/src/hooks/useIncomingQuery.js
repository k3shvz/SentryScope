import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Picks up a query handed to this page via navigation state, e.g.
 *   navigate('/dashboard/username', { state: { quickQuery: 'torvalds' } })
 * as done by the dashboard quick-search bar and the Advanced Search modal.
 *
 * Calls `onQuery(value)` exactly once with the incoming value, then clears
 * the navigation state so a refresh or back-navigation doesn't re-trigger it.
 *
 * `onQuery` is read via a ref so callers don't need to memoize it.
 */
export function useIncomingQuery(onQuery) {
  const location = useLocation();
  const navigate = useNavigate();
  const handledRef = useRef(false);
  const onQueryRef = useRef(onQuery);
  onQueryRef.current = onQuery;

  useEffect(() => {
    const incoming = location.state?.quickQuery;
    if (!incoming || handledRef.current) return;
    handledRef.current = true;
    onQueryRef.current?.(incoming);
    // Clear the state so it isn't re-consumed on refresh/back navigation.
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);
}
