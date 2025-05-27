//Por último, pay.js se carga de forma asíncrona y configura onGooglePayLoaded() como su controlador onload. Este método se definirá en main.js.



//=============================================================================
// Configuration
//=============================================================================

// The DOM element that the Google Pay button will be rendered into
// El elemento DOM sera representado por el boton de Google Pay.

//1 _ Establece la variable constante GPAY_BUTTON_CONTAINER_ID en el ID del elemento DOM que se usa en la página HTML como contenedor superior del botón de Google Pay.
const GPAY_BUTTON_CONTAINER_ID = 'gpay-container';

// Update the `merchantId` and `merchantName` properties with your own values.
// Actualizamos las propiedades de "merchantId y merchantName" con nuestros propios valores.
// Your real info is required when the environment is `PRODUCTION`.
// Nuestra informacion real es requerida para el entorno de 'Producción'.

// 3_ Actualiza las propiedades merchantId y merchantName con tus propios valores. Estos campos son opcionales cuando el entorno es TEST.
const merchantInfo = {
    merchantId: '12345678901234567890',
    merchantName: 'Example Merchant'
};

// This is the base configuration for all Google Pay payment data requests.
// Esta Configuración es la base para todas las solicitudes de pago de Google Pay.

// 2_ Crea el objeto de configuración baseGooglePayRequest con la configuración relevante para tu aplicación. Puedes encontrar cada una de las propiedades y los valores en la documentación de referencia. Los valores que se muestran en este ejemplo pueden o no coincidir perfectamente con tus necesidades, así que revísalos con cuidado.
const baseGooglePayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
    {
        type: 'CARD',
        parameters: {
        allowedAuthMethods: [
            "PAN_ONLY", "CRYPTOGRAM_3DS"
        ],
        allowedCardNetworks: [
            "AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"
            ]
        },
        tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId'
                }
            }
        }
    ],
    merchantInfo
};

// Prevent accidental edits to the base configuration. Mutations will be
// handled by cloning the config using deepCopy() and modifying the copy.
Object.freeze(baseGooglePayRequest);


// -- PARA TENER EN CUENTA -- 
// merchantId y merchantName no son obligatorios en el entorno TEST. Sin embargo, será obligatorio para el entorno PRODUCTION.


//=============================================================================
// Google Payments client singleton
//=============================================================================
// 4 _ La variable paymentsClient retendrá la instancia para el cliente una vez que se cree. Nuestro código no accede directamente a la variable, sino que siempre lo hace el método getGooglePaymentsClient().
let paymentsClient = null;

// 5_ El método getGooglePaymentsClient() verifica si ya se creó una instancia de un cliente y muestra esa instancia. Si no se creó una instancia anteriormente, se crea una, se guarda y se muestra. Este método garantiza que se cree y use una sola instancia durante la vida útil de esta secuencia de comandos.
function getGooglePaymentsClient() {
    if (paymentsClient === null) {
        //Para crear una instancia de un cliente, se invoca el método PaymentsClient(). En este ejemplo, le indicamos al cliente que estamos en un entorno TEST. La alternativa es PRODUCTION. Sin embargo, TEST es el valor predeterminado y se puede omitir.
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST',
            merchantInfo,
      // todo: paymentDataCallbacks (codelab pay-web-201)
        });
    }

    return paymentsClient;
}

// AGREGAMOS AYUDANTES --

// Las siguientes funciones auxiliares se usan más adelante en la secuencia de comandos y se agregaron con el único propósito de mejorar la legibilidad y el mantenimiento del código.

//=============================================================================
// Helpers
//=============================================================================

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

function renderGooglePayButton() {
    const button = getGooglePaymentsClient().createButton({
        onClick: onGooglePaymentButtonClicked
    });

    document.getElementById(GPAY_BUTTON_CONTAINER_ID).appendChild(button);
}

// --  Edición del botón. -- 
const container = document.getElementById('container');
const button = googlePayClient.createButton({
    buttonColor: 'black',
    buttonType: 'buy',
    buttonRadius: 93,
    buttonLocale: 'es',
    buttonSizeMode: 'fill',
    onClick: () => {},
  allowedPaymentMethods: [] // use the same payment methods as for the loadPaymentData() API call
});

container.appendChild(button);


// Agregamos Controladores de eventos .
//
//En esta secuencia de comandos, configuraremos dos controladores de eventos. Se llama al primero cuando termina de cargarse la biblioteca pay.js y al segundo cuando se hace clic en el botón de Google Pay.

//=============================================================================
// Event Handlers
//=============================================================================
// 1_ Se invoca onGooglePayLoaded() cuando se completa la carga de la secuencia de comandos pay.js, como se define en el archivo HTML. Se invoca el método isReadyToPay() para determinar si se debe mostrar o no el botón de Google Pay. Si el consumidor está listo para pagar (es decir, agregó una forma de pago a su Billetera de Google), se renderiza el botón de Google Pay.
function onGooglePayLoaded() {
  const req = deepCopy(baseGooglePayRequest);

  getGooglePaymentsClient()
    .isReadyToPay(req)
    .then(function(res) {
      if (res.result) {
        renderGooglePayButton();
      } else {
        console.log("Google Pay is not ready for this user.");
      }
    })
    .catch(console.error);
}
// onGooglePaymentButtonClicked() se invoca cuando se hace clic en el botón de Google Pay. Este método invoca el método de la biblioteca loadPaymentData(), que se usa para recuperar un token de pago. Una vez que tengas el token de pago, lo enviarás a tu puerta de enlace de pagos para que procese la transacción. transactionInfo describe la transacción que se debe procesar con este clic en el botón.

function onGooglePaymentButtonClicked() {
  // Create a new request data object for this request
  const req = {
    ...deepCopy(baseGooglePayRequest),
    transactionInfo: {
      countryCode: 'US',
      currencyCode: 'USD',
      totalPriceStatus: 'FINAL',
      totalPrice: (Math.random() * 999 + 1).toFixed(2),
    },
    // todo: callbackIntents (codelab gpay-web-201)
  };

  // Write request object to console for debugging
  console.log(req);

  getGooglePaymentsClient()
    .loadPaymentData(req)
    .then(function (res) {
      // Write response object to console for debugging
      console.log(res);
      // @todo pass payment token to your gateway to process payment
      // @note DO NOT save the payment credentials for future transactions
      paymentToken = res.paymentMethodData.tokenizationData.token;
    })
    .catch(console.error);
}
