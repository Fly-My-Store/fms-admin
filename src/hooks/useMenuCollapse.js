import { useEffect } from 'react';

import { matchesMenuRoute } from 'utils/menuRoute';

// ==============================|| MENU COLLAPSED - RECURSIVE FUNCTION ||============================== //

function setParentOpenedMenu(items, pathname, menuId, setSelected, setOpen) {
  for (const item of items) {
    if (item.children?.length) {
      setParentOpenedMenu(item.children, pathname, menuId, setSelected, setOpen);
    }

    if (item.url && matchesMenuRoute(pathname, item.url)) {
      setSelected(menuId ?? null);
      setOpen(true);
    }
  }
}

// ==============================|| MENU COLLAPSED - HOOK ||============================== //

export default function useMenuCollapse(menu, pathname, miniMenuOpened, setSelected, setOpen, setAnchorEl) {
  useEffect(() => {
    setOpen(false);

    if (!miniMenuOpened) {
      setSelected(null);
    } else {
      setAnchorEl(null);
    }

    if (menu.children?.length) {
      setParentOpenedMenu(menu.children, pathname, menu.id, setSelected, setOpen);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children]);
}
