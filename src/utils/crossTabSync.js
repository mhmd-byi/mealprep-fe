const CHANNEL_NAME = "mealprep-data-sync";

export const notifyUsersChanged = () => {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "users-changed" });
    channel.close();
  } catch (e) {
    // BroadcastChannel unsupported — same-tab invalidation still works regardless.
  }
};

export const listenForUsersChanged = (onChanged) => {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === "users-changed") onChanged();
    };
    return () => channel.close();
  } catch (e) {
    return () => {};
  }
};
