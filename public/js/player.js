// This file only runs on the player page


// Add any player-specific JavaScript here
setTimeout(() => {



	const lattext = document.querySelectorAll(".lattextblock")

	function showStamma(stamma) {
		document.body.style.width = "100%"
		lattext.forEach((element) => {
			element.style.display = "block"
			if (!element.classList.contains(stamma)) {
				element.style.display = "none"
			}
		})
	}

	const buttons = document.querySelectorAll("button[type='button'][role='radio']")

	buttons.forEach((button) => {
		button.addEventListener("click", (e) => {
			buttons.forEach((btn) => {
				btn.classList.remove("active")
			})
			button.classList.add("active")
			var stamma = button.classList[19]

			switch (stamma) {
				case "voice-part-sopran":
					showStamma("s")
					break
				case "voice-part-alt":
					showStamma("a")
					break
				case "voice-part-tenor":
					showStamma("t")
					break
				case "voice-part-bas":
					showStamma("b")
					break
				default:
					lattext.forEach((element) => {
						element.style.display = "block"
					})
			}
		})
	})
}, "500")
