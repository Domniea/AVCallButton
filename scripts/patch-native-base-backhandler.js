/**
 * NativeBase 3.4.x still calls BackHandler.removeEventListener, which RN 0.81
 * removed. Rewrite useBackHandler to the subscription.remove() API.
 */
const fs = require("fs");
const path = require("path");

const candidateRoots = [
  path.join(__dirname, "..", "node_modules", "native-base"),
  path.join(__dirname, "..", "apps", "mobile", "node_modules", "native-base"),
];

const root = candidateRoots.find((dir) => fs.existsSync(dir));
if (!root) {
  process.exit(0);
}

const targets = [
  {
    file: path.join(root, "src", "hooks", "useKeyboardDismissable.ts"),
    old: `export function useBackHandler({ enabled, callback }: IParams) {
  useEffect(() => {
    let backHandler = () => {
      callback();
      return true;
    };
    if (enabled) {
      BackHandler.addEventListener('hardwareBackPress', backHandler);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
  }, [enabled, callback]);
}`,
    next: `export function useBackHandler({ enabled, callback }: IParams) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        callback();
        return true;
      }
    );
    return () => subscription.remove();
  }, [enabled, callback]);
}`,
  },
  {
    file: path.join(root, "lib", "module", "hooks", "useKeyboardDismissable.js"),
    old: `export function useBackHandler({
  enabled,
  callback
}) {
  useEffect(() => {
    let backHandler = () => {
      callback();
      return true;
    };

    if (enabled) {
      BackHandler.addEventListener('hardwareBackPress', backHandler);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }

    return () => BackHandler.removeEventListener('hardwareBackPress', backHandler);
  }, [enabled, callback]);
}`,
    next: `export function useBackHandler({
  enabled,
  callback
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      callback();
      return true;
    });
    return () => subscription.remove();
  }, [enabled, callback]);
}`,
  },
  {
    file: path.join(
      root,
      "lib",
      "commonjs",
      "hooks",
      "useKeyboardDismissable.js",
    ),
    old: `function useBackHandler({
  enabled,
  callback
}) {
  (0, _react.useEffect)(() => {
    let backHandler = () => {
      callback();
      return true;
    };

    if (enabled) {
      _reactNative.BackHandler.addEventListener('hardwareBackPress', backHandler);
    } else {
      _reactNative.BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }

    return () => _reactNative.BackHandler.removeEventListener('hardwareBackPress', backHandler);
  }, [enabled, callback]);
}`,
    next: `function useBackHandler({
  enabled,
  callback
}) {
  (0, _react.useEffect)(() => {
    if (!enabled) {
      return;
    }

    const subscription = _reactNative.BackHandler.addEventListener('hardwareBackPress', () => {
      callback();
      return true;
    });

    return () => subscription.remove();
  }, [enabled, callback]);
}`,
  },
];

let changed = 0;
for (const target of targets) {
  if (!fs.existsSync(target.file)) continue;
  const text = fs.readFileSync(target.file, "utf8");
  if (text.includes("subscription.remove()")) continue;
  if (!text.includes(target.old)) {
    console.warn(
      `[patch-native-base-backhandler] pattern not found in ${path.relative(process.cwd(), target.file)}`,
    );
    continue;
  }
  fs.writeFileSync(target.file, text.replace(target.old, target.next));
  changed += 1;
}

if (changed > 0) {
  console.log(
    `[patch-native-base-backhandler] patched ${changed} NativeBase BackHandler file(s)`,
  );
}
