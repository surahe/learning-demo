
try {
    console.log('before throw error');
    throw new Error('throw error');
    console.log('after throw error');
} catch (err) {
    console.log(err.message);
}

// before throw error
// throw error