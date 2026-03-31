
// Pin/unpin an article
export async function setPagePin(slug, pinned, token) {
  const response = await fetch(`/api/pages/${slug}/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pinned }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Failed to update pin." }));
    throw new Error(data.message || "Failed to update pin.");
  }
  return response.json();
}
export async function deletePage(slug, token) {
  const response = await fetch(`/api/pages/${slug}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Failed to delete." }));
    throw new Error(data.message || "Failed to delete.");
  }
  return response.json();
}

export async function getPages(token) {
  const response = await fetch("/api/pages", {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch pages. Please Refresh.");
  }
  return response.json();
}


export async function getPageBySlug(slug, token) {
  const response = await fetch(`/api/pages/${slug}`,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
  if (!response.ok) {
    throw new Error("Page not found.");
  }
  return response.json();
}


export async function savePage(payload, token) {
  const response = await fetch("/api/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Failed to save." }));
    throw new Error(data.message || "Failed to save.");
  }
  return response.json();
}
