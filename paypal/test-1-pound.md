Part 1
Paste this code in your website’s <head> (or at the top of your page’s <body> above the Part 2 code) only once per page.

<script
  src="https://www.paypal.com/sdk/js?client-id=BAAN6q5jlYzdUID15B8q5xbeHol_TxFmrkN8L02lbb5XWZtUzEfVjoI_vSZ8g8P-en4pYaWK3C3PnaxDTY&components=hosted-buttons&disable-funding=venmo&currency=GBP" 
  crossorigin="anonymous" 
  async>
</script>

Copy Code
Part 2
Paste this code in your page's <body>.

<script>
  document.addEventListener("DOMContentLoaded", (event) => {
    paypal.HostedButtons({
      hostedButtonId: "CS7837DA9Y362"
    })
    .render("#paypal-container-CS7837DA9Y362")
  })
</script>

Copy Code
Part 3
Paste this code in the page where you want the button to appear, near your product.

<div id="paypal-container-CS7837DA9Y362"></div>

Copy Code