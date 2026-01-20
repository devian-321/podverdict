import app from './src/podVerdict/app'


const PORT = process.env.PORT || 3000


app.listen(PORT, () => {
    console.log(`PodVerdict Server spinning up to http://localhost:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})