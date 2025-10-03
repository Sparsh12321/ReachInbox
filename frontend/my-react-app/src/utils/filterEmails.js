// utils/filterEmails.js
export function filterEmails(emails, selectedCategory, searchQuery) {
  return emails.filter(email => {
    let matchesCategory = selectedCategory === 'all' || email.label === selectedCategory;

    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = (
        email.subject?.toLowerCase().includes(query) ||
        email.from?.toLowerCase().includes(query) ||
        email.body?.toLowerCase().includes(query) ||
        email.body_text?.toLowerCase().includes(query)
      );
    }

    return matchesCategory && matchesSearch;
  });
}
