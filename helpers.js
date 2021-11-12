const getUserByEmail = (email, database) => {
  for (const user_id in database) {
    const user = database[user_id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };
