const landing = (req, res) => {
	try {
		return res.status(200).json({ msg: "this is a template api" })
	} catch (error) {
		return res.status(500).json({ msg: "Internal Server Error Occured" })
	}
}

export { landing }